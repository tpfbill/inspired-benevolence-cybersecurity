import express, { Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import Incident from '../models/Incident';
import Playbook from '../models/Playbook';
import logger from '../utils/logger';
import { Op } from 'sequelize';

const router = express.Router();

router.get('/dashboard', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }

    const totalIncidents = await Incident.count({ where: dateFilter });
    const resolvedIncidents = await Incident.count({
      where: { ...dateFilter, status: 'resolved' }
    });
    const activePlaybooks = await Playbook.count({ where: { status: 'active' } });

    const incidentsByTypeRaw = await Incident.findAll({
      where: dateFilter,
      attributes: [
        'incidentType',
        [Incident.sequelize!.fn('COUNT', Incident.sequelize!.col('id')), 'count']
      ],
      group: ['incidentType'],
      raw: true
    });

    const incidentsBySeverityRaw = await Incident.findAll({
      where: dateFilter,
      attributes: [
        'severity',
        [Incident.sequelize!.fn('COUNT', Incident.sequelize!.col('id')), 'count']
      ],
      group: ['severity'],
      raw: true
    });

    // Transform data to ensure count is a number
    const incidentsByType = incidentsByTypeRaw.map((item: any) => ({
      incidentType: item.incidentType,
      count: parseInt(item.count, 10)
    }));

    const incidentsBySeverity = incidentsBySeverityRaw.map((item: any) => ({
      severity: item.severity,
      count: parseInt(item.count, 10)
    }));

    const averageResolutionTime = await Incident.findAll({
      where: {
        ...dateFilter,
        resolvedAt: { [Op.ne]: null }
      },
      attributes: [
        [
          Incident.sequelize!.fn(
            'AVG',
            Incident.sequelize!.literal('EXTRACT(EPOCH FROM ("resolvedAt" - "detectedAt"))')
          ),
          'avgSeconds'
        ]
      ]
    });

    res.json({
      summary: {
        totalIncidents,
        resolvedIncidents,
        activePlaybooks,
        resolutionRate: totalIncidents > 0 ? (resolvedIncidents / totalIncidents) * 100 : 0
      },
      incidentsByType,
      incidentsBySeverity,
      averageResolutionTime: averageResolutionTime[0]?.get('avgSeconds') || 0
    });
  } catch (error) {
    logger.error('Get compliance dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch compliance data' });
  }
});

router.get('/frameworks', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const frameworks = [
      {
        name: 'NIST CSF',
        categories: ['Identify', 'Protect', 'Detect', 'Respond', 'Recover'],
        coverage: 85
      },
      {
        name: 'ISO 27001',
        categories: ['A.16 Information Security Incident Management'],
        coverage: 78
      },
      {
        name: 'PCI DSS',
        categories: ['Requirement 12.10 - Incident Response Plan'],
        coverage: 90
      }
    ];

    res.json(frameworks);
  } catch (error) {
    logger.error('Get frameworks error:', error);
    res.status(500).json({ error: 'Failed to fetch frameworks' });
  }
});

export default router;
