
      import { Table, Column, Model, DataTypes, ForeignKey,  BelongsTo } from 'sequelize-typescript';
      import { Usuarios } from './Usuarios.entity';

      @Table({
        tableName: 'logs',
      })
      export class Logs extends Model<Logs> {
        @Column({"type": DataTypes.INTEGER,"allowNull":false,"primaryKey":true,"autoIncrement":true})
  id: number;
@Column({"type": DataTypes.STRING(15),"allowNull":false})
  method: string;
@Column({"type": DataTypes.STRING(40),"allowNull":true})
  ip: string;
@Column({"type": DataTypes.STRING(150),"allowNull":false})
  reading_file: string;
@Column({"type": DataTypes.STRING,"allowNull":true})
  create_date: string;

        @ForeignKey(() => Usuarios)
  @Column({
    type: DataTypes.INTEGER, allowNull: true,
  })
  user: number;

  @BelongsTo(() => Usuarios)
  user_id: number;

  
      }

    