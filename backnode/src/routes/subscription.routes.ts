import { Router } from 'express';
import { createSubscriptionController } from '../controllers/subscription.controller';

const subscriptionsRoutes = Router();

subscriptionsRoutes.post('/subscriptions', createSubscriptionController);

export default subscriptionsRoutes;
