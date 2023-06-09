import { Sequelize } from "sequelize";

export class SequelizeService {
    static #instance;
    
    static getInstance() {
        if (!SequelizeService.#instance) {
            SequelizeService.#instance = new Sequelize(
                "tsbdts_db",
                "api",
                "YXb4ZFRIVBtIvvGR5l31Q7TLb2VEl0xf",
                {
                    host: "dpg-ch2irhd269v61fdi38h0-a.frankfurt-postgres.render.com",
                    port: 5432,
                    logging: false,
                    dialect: 'postgres',
                    dialectOptions: {
                        ssl: {
                          require: true,
                          rejectUnauthorized: false
                        }
                    }
                }
            )
        }
        return SequelizeService.#instance;
    }
}