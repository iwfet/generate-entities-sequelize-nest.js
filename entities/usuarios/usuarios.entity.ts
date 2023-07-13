
      import { Table, Column, Model, DataTypes, ForeignKey,  BelongsTo } from 'sequelize-typescript';
      

      @Table({
        tableName: 'usuarios',
      })
      export class Usuarios extends Model<Usuarios> {
        @Column({"type": DataTypes.INTEGER,"allowNull":false,"primaryKey":true,"autoIncrement":true})
  id: number;
@Column({"type": DataTypes.STRING(255),"allowNull":false,"unique":true})
  user: string;
@Column({"type": DataTypes.STRING(255),"allowNull":false})
  password: string;
@Column({"type": DataTypes.STRING(255),"allowNull":false})
  folder: string;
@Column({"type": DataTypes.STRING,"allowNull":false})
  last_acess: string;

        
      }

    