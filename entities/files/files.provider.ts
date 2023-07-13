
    import { Files } from './files.entity';

    export const filesProvider = [
      {
        provide: FILES_REPOSITORY,
        useValue:  Files,
      },
    ];
    