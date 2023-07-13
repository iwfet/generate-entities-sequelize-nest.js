
    import { Logs } from './logs.entity';

    export const logsProvider = [
      {
        provide: LOGS_REPOSITORY,
        useValue:  Logs,
      },
    ];
    