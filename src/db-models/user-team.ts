import { DataTypes } from "sequelize";
import sequelize from "../utils/sequelize";
import { Utente } from "./user";
import { Team } from "./team";

const UtenteTeam = sequelize.define('UserTeam', {
    utente_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Utente,
            key: 'id'
        }
    },
    team_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Team,
            key: 'id'
        }
    },
}, {
    tableName: 'utenti_team'
});

Team.belongsToMany(Utente, { through: UtenteTeam, as: 'utenti', foreignKey: 'team_id' });
Utente.belongsToMany(Team, { through: UtenteTeam, as: 'team', foreignKey: 'utente_id' });


export { UtenteTeam };