import { Router, Request, Response, NextFunction } from 'express';
import { findTrains } from '../controllers/webhook';

export interface Parameters {
    Station: string[];
}

interface QueryResult {
    intent: {
        displayName: string;
    };
    parameters: Parameters;
}

interface WebhookRequestBody {
    queryResult: QueryResult;
}

const webHookRouter: Router = Router();

const intent_handler: { [key: string]: (parameters: Parameters) => Promise<any> } = {
    'search.train': findTrains,
};

webHookRouter.post('/chatbot', async (req: Request<{}, {}, WebhookRequestBody>, res: Response, next: NextFunction) => {
    try {
        const intent = req.body.queryResult.intent.displayName;
        const parameters = req.body.queryResult.parameters;

        const handler = intent_handler[intent];

        const result = await handler(parameters);
        return res.json(result);

    } catch (error) {
        return next(error);
    }
});

export default webHookRouter;
