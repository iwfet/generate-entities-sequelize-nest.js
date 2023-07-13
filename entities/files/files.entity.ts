
      import { Table, Column, Model, DataTypes, ForeignKey,  BelongsTo } from 'sequelize-typescript';
      import { Usuarios } from './Usuarios.entity';

      @Table({
        tableName: 'files',
      })
      export class Files extends Model<Files> {
        @Column({"type": DataTypes.STRING(150),"allowNull":false,"primaryKey":true,"autoIncrement":true})
  name_file: string;
@Column({"type": DataTypes.INTEGER,"allowNull":false,"primaryKey":true,"autoIncrement":true})
  creator_user: number;
@Column({"type": DataTypes.STRING(255),"allowNull":false})
  path_file: string;
@Column({"type": DataTypes.BOOLEAN,"allowNull":false,"defaultValue":true})
  creator_user_only_view: boolean;
@Column({"type": DataTypes.BOOLEAN,"allowNull":false,"defaultValue":true})
  public: boolean;
@Column({"type": DataTypes.STRING,"allowNull":false})
  creator_date: string;

        @ForeignKey(() => Usuarios)
  @Column({
    type: DataTypes.INTEGER,
  })
  creator_user: number;

  @BelongsTo(() => Usuarios)
  creator_user_id: number;

  
      }

    