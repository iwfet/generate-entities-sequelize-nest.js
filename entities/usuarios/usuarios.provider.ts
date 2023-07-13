
    import { Usuarios } from './usuarios.entity';

    export const usuariosProvider = [
      {
        provide: USUARIOS_REPOSITORY,
        useValue:  Usuarios,
      },
    ];
    