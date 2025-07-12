import express, { ErrorRequestHandler } from 'express'
import { Transaction } from 'sequelize'
import cors from 'cors'
import { expressjwt, UnauthorizedError } from 'express-jwt'
import { Connect, database } from './database'

interface Boostrap {
    origin?: string
    exposed?: string[]
    secret?: string
    headers?: string[]
    authorization?: {
        exposed?: string[]
        secret: string
    }
}

Connect()

export const Bootstrap = async ( { origin, authorization }: Boostrap ) => {
    const prod = (import.meta as any).env.MODE === 'production'

    const app = express()

    app.use(cors({ origin: prod && origin ? origin : '*' }))
    app.use(express.json())

    if ( authorization && authorization?.secret ) {
        const exposed = authorization?.exposed?.map(p => p.includes(':') ? new RegExp('^' + p.replace(/:[^/]+/g, '[^/]+') + '$') : p) || []
        const secret = authorization.secret

        app.use(expressjwt({ secret, algorithms: ['HS256'] }).unless({ path: exposed }));
        app.use(((err, req, res, next) => {
            if (err instanceof UnauthorizedError) {
                return res.status(401).json({ error: true, message: 'Invalid token' })
            }
            next(err)
        }) as ErrorRequestHandler)
    }

    const files = (import.meta as any).glob('../src/**/*.{ts,js}', { eager: true })

    const routes = Object.entries(files)
    .filter(([_, m]: any) => typeof m.default === 'function')
    .map(([file, m]) => {
        const path ='/' + file
            .replace(/^\.{0,2}\/src\//, '')        // ../src/ → ''
            .replace(/(?:\/index)?\.(ts|js)$/, '') // quita .ts/.js y opcional /index
            .replace(/\[([^\]]+)]/g, ':$1')        // [id] → :id
            .replace(/\/+$/, '')                   // barra final
            .replace('index', '')
            .toLowerCase() || '/';
        return { path, module: m };
    }).sort((a, b) => (a.path.includes(':') ? 1 : -1));

    routes.forEach(({ path, module }) => {
        app.all(path, async (req, res) => {
            const transaction = await database.transaction()
            try {
                console.log(`${path} ${JSON.stringify(req.body || req.query)}` )
                const response = await (module as any).default(req, transaction)
                await transaction.commit()
                res.status(200).json(response)
            } catch (error: any) {
                if (!(transaction as any).finished) await transaction.rollback()
                console.error(`error ${path}`, error);
                const status = error.statusCode || error.status || 500;
                res.status(status).json({
                    error: true,
                    message: error.message || 'An unexpected error occurred',
                    // Include any additional error details
                    ...(error.details && { details: error.details })
                });
            }
        })
    });

    return app
}