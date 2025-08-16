const express = require('express');
const router = express.Router();
const { executeQuery } = require('../../../shared/database/connection');
const logger = require('../../../shared/utils/logger');

/**
 * POST /api/admin/export/:table - Exporter des données
 */
router.post('/:table', async(req, res) => {
    try {
        const { table } = req.params;
        const { format = 'csv', filters = {}, options = {} } = req.body;

        const validTables = ['brands', 'models', 'user_scores', 'game_sessions'];
        if (!validTables.includes(table)) {
            return res.status(400).json({
                success: false,
                error: 'Table non autorisée pour l\'export'
            });
        }

        const data = await exportTableData(table, filters, options);
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `${table}_export_${timestamp}.${format}`;

        if (format === 'csv') {
            const csv = convertToCSV(data);
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send('\ufeff' + csv); // BOM pour Excel
        } else if (format === 'json') {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.json({
                table,
                exported_at: new Date().toISOString(),
                count: data.length,
                data
            });
        } else {
            return res.status(400).json({
                success: false,
                error: 'Format d\'export non supporté'
            });
        }

        logger.info('Data exported:', { table, format, count: data.length });
    } catch (error) {
        logger.error('Error exporting data:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'export'
        });
    }
});

/**
 * GET /api/admin/export/template/:table - Télécharger un template d'import
 */
router.get('/template/:table', async(req, res) => {
    try {
        const { table } = req.params;

        const templates = {
            brands: [
                { name: 'Toyota', country: 'Japon' },
                { name: 'Ford', country: 'États-Unis' }
            ],
            models: [
                { name: 'Corolla', brand_id: 1, year: 2024, difficulty_level: 1, image_url: '' },
                { name: 'Focus', brand_id: 2, year: 2024, difficulty_level: 1, image_url: '' }
            ]
        };

        const template = templates[table];
        if (!template) {
            return res.status(404).json({
                success: false,
                error: 'Template non disponible pour cette table'
            });
        }

        const csv = convertToCSV(template);
        const filename = `${table}_template.csv`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send('\ufeff' + csv);

    } catch (error) {
        logger.error('Error generating template:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la génération du template'
        });
    }
});

// Fonctions utilitaires
async function exportTableData(table, filters = {}, options = {}) {
    let query = `SELECT * FROM ${table}`;
    let params = [];

    // Ajouter des filtres
    if (Object.keys(filters).length > 0) {
        const conditions = Object.keys(filters).map(key => {
            if (filters[key] === null) {
                return `${key} IS NULL`;
            }
            return `${key} = ?`;
        });
        query += ` WHERE ${conditions.join(' AND ')}`;
        params = Object.values(filters).filter(value => value !== null);
    }

    // Ajouter des options de tri
    if (options.sortBy) {
        query += ` ORDER BY ${options.sortBy} ${options.sortOrder || 'ASC'}`;
    }

    // Ajouter une limite
    if (options.limit) {
        query += ' LIMIT ?';
        params.push(options.limit);
    }

    return await executeQuery(query, params);
}

function convertToCSV(data) {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');

    const csvRows = data.map(row => {
        return headers.map(header => {
            let value = row[header];

            // Gérer les valeurs null/undefined
            if (value === null || value === undefined) {
                value = '';
            }

            // Gérer les dates
            if (value instanceof Date) {
                value = value.toISOString();
            }

            // Échapper les guillemets et entourer de guillemets si nécessaire
            value = String(value);
            if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
}

module.exports = router;
