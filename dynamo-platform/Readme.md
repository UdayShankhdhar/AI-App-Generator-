Dynamo PlatForm -Config-Driven Application Runtime

A fully dynamic, config-driven application application platform that generates UIs,APIs, and database schemas from JSON configurations.

ARCHITECTURE

dynamo-platform/
|--frontend/            # Next.js 14 (App Router)
|--backend/             #Node.js + TypeScript(Express)
|shared/                #shared types aND CONFIG SCHEMAS

Features
>Dynamic UI generation from JSON config
>Dynamic RESTAPI generation
>PostgreSQL schema auto-generation
>JWT Authentication(email/password)
>Multi-language/il8n support
>CSV Import system
>Event-based notification(mock email)
>Resilent to incomplete/invalid configs

Quick Start

Backend
cd backend
npm install
cp .env.example .env   # Set DATABASE_URL, JWT_SECRET
npm run migrate
npm run dev

Frontend
cd frontend
npm install
cp .env.example .env.local
npm run dev

Config Format
See shared/config.schema.ts for full schema.example:

JSON
{
    "app": {"name":"My App","locale":"en"},
    "auth":{"enabled":{true},"methods":["email"]},
    "pages":[
        {
            "id":"users",
            "title":"Users",
            "components":[
                {
                    "type":"table",
                    "dataSource":"users",
                    "columns":["name","email","role"]
                }
            ]
        }
    ]
    "database":{
        "tables":[
            {
                "name":"users",
                "feilds":[
                    {"name":"name","type":"text","required":true},
                    {"name":"email","type":"text","required":true,"unique":true}
                ]
            }
        ]
    }
}