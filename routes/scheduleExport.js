const express = require('express');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const router = express.Router();

// Middleware для проверки аутентификации
const checkAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Не авторизован' });
    }
    next();
};

// Эндпоинт для экспорта расписания
router.post('/api/schedule/export', checkAuth, async (req, res) => {
    try {
        const { format } = req.body;
        const user = req.session.user;

        console.log('Export request from:', user.Login, 'format:', format);

        // Демо-данные расписания (замените на реальные из вашей БД)
        const scheduleData = await getScheduleData(user);

        if (format === 'excel') {
            await exportToExcel(scheduleData, res, user);
        } else if (format === 'pdf') {
            await exportToPDF(scheduleData, res, user);
        } else {
            return res.status(400).json({ error: 'Неверный формат экспорта' });
        }

    } catch (error) {
        console.error('Ошибка экспорта:', error);
        res.status(500).json({ error: 'Ошибка при экспорте данных' });
    }
});

// Функция для получения данных расписания (демо-версия)
async function getScheduleData(user) {
    // Здесь должна быть ваша логика получения реального расписания
    // Пока используем демо-данные
    
    return {
        user: {
            name: `${user.Surname} ${user.Name}`,
            role: user.Role,
            group: user.Group || 'Не указана'
        },
        schedule: {
            weekType: 'Верхняя неделя',
            period: '01.04.2025 - 07.04.2025',
            days: [
                {
                    day: 'Понедельник',
                    date: '2025-04-01',
                    lessons: [
                        {
                            time: '09:00-10:30',
                            subject: 'Математика',
                            type: 'Лекция',
                            classroom: '3315',
                            teacher: 'Иванов А.С.',
                            groups: ['5091', '5092']
                        },
                        {
                            time: '11:00-12:30',
                            subject: 'Программирование',
                            type: 'Практика',
                            classroom: '4412',
                            teacher: 'Петрова О.И.',
                            groups: ['5091']
                        }
                    ]
                },
                {
                    day: 'Вторник',
                    date: '2025-04-02',
                    lessons: [
                        {
                            time: '13:00-14:30',
                            subject: 'Базы данных',
                            type: 'Лабораторная',
                            classroom: '5510',
                            teacher: 'Сидоров В.П.',
                            groups: ['5092']
                        }
                    ]
                },
                {
                    day: 'Среда',
                    date: '2025-04-03',
                    lessons: [] // Нет занятий
                }
            ]
        }
    };
}

// Экспорт в Excel
async function exportToExcel(scheduleData, res, user) {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Расписание');

        // Заголовок
        worksheet.mergeCells('A1:H1');
        worksheet.getCell('A1').value = `Расписание занятий - ${scheduleData.user.name}`;
        worksheet.getCell('A1').font = { size: 16, bold: true };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };

        // Информация
        worksheet.getCell('A2').value = `Период: ${scheduleData.schedule.period}`;
        worksheet.getCell('A3').value = `Тип недели: ${scheduleData.schedule.weekType}`;
        worksheet.getCell('A4').value = `Группа: ${scheduleData.user.group}`;
        worksheet.getCell('A5').value = `Роль: ${scheduleData.user.role}`;

        // Пустая строка
        worksheet.addRow([]);

        // Заголовки таблицы
        const headers = ['День', 'Дата', 'Время', 'Предмет', 'Тип', 'Аудитория', 'Преподаватель', 'Группы'];
        const headerRow = worksheet.addRow(headers);

        // Стили для заголовков
        headerRow.font = { bold: true };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE6E6FA' }
        };

        // Данные
        scheduleData.schedule.days.forEach(day => {
            if (day.lessons && day.lessons.length > 0) {
                day.lessons.forEach(lesson => {
                    worksheet.addRow([
                        day.day,
                        new Date(day.date).toLocaleDateString('ru-RU'),
                        lesson.time,
                        lesson.subject,
                        lesson.type,
                        lesson.classroom,
                        lesson.teacher,
                        Array.isArray(lesson.groups) ? lesson.groups.join(', ') : lesson.groups
                    ]);
                });
            } else {
                worksheet.addRow([
                    day.day,
                    new Date(day.date).toLocaleDateString('ru-RU'),
                    '', '', 'Нет занятий', '', '', ''
                ]);
            }
        });

        // Авто-ширина колонок
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, cell => {
                const columnLength = cell.value ? cell.value.toString().length : 10;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            });
            column.width = Math.min(maxLength + 2, 30);
        });

        // Установка заголовков ответа
        const filename = `расписание_${user.Surname}_${new Date().toISOString().split('T')[0]}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(filename)}`);

        // Отправка файла
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Excel export error:', error);
        throw new Error('Ошибка создания Excel файла');
    }
}

// Экспорт в PDF
async function exportToPDF(scheduleData, res, user) {
    try {
        const doc = new PDFDocument({ margin: 50 });
        
        const filename = `расписание_${user.Surname}_${new Date().toISOString().split('T')[0]}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(filename)}`);

        doc.pipe(res);

        // Заголовок
        doc.fontSize(20).font('Helvetica-Bold')
           .text('Расписание занятий', 50, 50, { align: 'center' });
        
        doc.fontSize(12).font('Helvetica')
           .text(`Студент: ${scheduleData.user.name}`, 50, 90)
           .text(`Период: ${scheduleData.schedule.period}`, 50, 110)
           .text(`Тип недели: ${scheduleData.schedule.weekType}`, 50, 130)
           .text(`Группа: ${scheduleData.user.group}`, 50, 150)
           .text(`Роль: ${scheduleData.user.role}`, 50, 170);

        let yPosition = 200;

        // Данные расписания
        scheduleData.schedule.days.forEach(day => {
            if (yPosition > 700) {
                doc.addPage();
                yPosition = 50;
            }

            doc.fontSize(14).font('Helvetica-Bold')
               .text(`${day.day} (${new Date(day.date).toLocaleDateString('ru-RU')})`, 50, yPosition);
            yPosition += 25;

            if (day.lessons && day.lessons.length > 0) {
                day.lessons.forEach(lesson => {
                    if (yPosition > 750) {
                        doc.addPage();
                        yPosition = 50;
                    }

                    doc.fontSize(10).font('Helvetica')
                       .text(`⏰ ${lesson.time} | ${lesson.subject} (${lesson.type})`, 70, yPosition)
                       .text(`   📍 ${lesson.classroom} | 👨‍🏫 ${lesson.teacher} | 👥 ${Array.isArray(lesson.groups) ? lesson.groups.join(', ') : lesson.groups}`, 70, yPosition + 15);
                    
                    yPosition += 40;
                });
            } else {
                doc.fontSize(10).font('Helvetica')
                   .text('   Нет занятий', 70, yPosition);
                yPosition += 30;
            }

            yPosition += 10;
        });

        // Подвал
        doc.fontSize(8)
           .text(`Сгенерировано: ${new Date().toLocaleDateString('ru-RU')}`, 50, 780, { align: 'center' });

        doc.end();

    } catch (error) {
        console.error('PDF export error:', error);
        throw new Error('Ошибка создания PDF файла');
    }
}

module.exports = router;