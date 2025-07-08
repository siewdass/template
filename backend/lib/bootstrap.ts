import express, { ErrorRequestHandler } from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import { expressjwt, UnauthorizedError } from 'express-jwt'

interface Boostrap {
    origin?: string
    open: string[]
    secret: string
    headers?: string[]
}

export const Bootstrap = async ( { origin, open, secret }: Boostrap ) => {
    const app = express()

    app.use(cors({ origin }))
    app.use(express.json())

    const nonprotected = open.map(p =>p.includes(':') ? new RegExp('^' + p.replace(/:[^/]+/g, '[^/]+') + '$') : p)

    app.use(expressjwt({ secret, algorithms: ['HS256'] }).unless({ path: nonprotected }));
    app.use(((err, req, res, next) => {
        if (err instanceof UnauthorizedError) {
            return res.status(401).json({ error: true, message: 'Invalid token' })
        }
        next(err)
    }) as ErrorRequestHandler)

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
            console.error(`${path} ${error.message}`, )
            res.status(error.statusCode || 500).json({
                error: true,
                message: error.message || 'An unexpected error occurred'
            })
            }
        })
    });

    return app
}