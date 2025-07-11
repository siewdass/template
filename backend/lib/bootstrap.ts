import express, { ErrorRequestHandler } from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import { expressjwt, UnauthorizedError } from 'express-jwt'
import { initialize } from './database'

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

export const Bootstrap = async ( { origin, authorization }: Boostrap ) => {
    initialize()
    
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
        try {
            console.log(`${path} ${JSON.stringify(req.body || req.query)}` )
            res.status(200).json(
                await (module as any).default(req)
            )
        } catch (error: any) {
            console.error(`error ${path} ${error.message}`, )
            res.status(error.statusCode || 500).json({
                error: true,
                message: error.message || 'An unexpected error occurred'
            })
        }
        })
    });

    return app
}