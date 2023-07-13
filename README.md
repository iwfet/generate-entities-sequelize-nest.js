# Aplicativo de Geração de Entidades para API Nest.js com Sequelize

[English Version](#entity-generation-app-for-nest.js-api-with-sequelize)

Este é um aplicativo que gera automaticamente entidades de pessoas no formato da API Nest.js utilizando o Sequelize como ORM (Object-Relational Mapping) para integração com o banco de dados. Observe que este aplicativo ainda está em versão beta e pode gerar entidades incorretas ou incompletas.

## Configuração do Banco de Dados

Before de executar o aplicativo, você precisa configurar corretamente o banco de dados. Siga as etapas abaixo:

1. Instale o PostgreSQL em seu sistema.
2. Crie um banco de dados vazio.
3. Abra o arquivo `sequelize.js` e configure as informações de conexão com o banco de dados. Certifique-se de fornecer o nome do banco de dados, o nome de usuário e a senha corretos.

## Executando o Aplicativo

Siga as etapas abaixo para executar o aplicativo e gerar as entidades das pessoas:

1. Instale as dependências do aplicativo executando o comando `npm install`.
2. Certifique-se de que o banco de dados esteja configurado corretamente de acordo com as etapas acima.
3. No arquivo `index.js`, descomente a linha `generateEntities();`.
4. Execute o aplicativo usando o comando `npm start`.
5. O aplicativo irá consultar as tabelas do banco de dados e gerar as entidades das pessoas no formato da API Nest.js utilizando o Sequelize.
6. Verifique o diretório `/entities` para encontrar os arquivos gerados. Cada entidade terá seu próprio diretório contendo o arquivo `.entity.ts` e o arquivo `.provider.ts`.

## Importante

- Lembre-se de que este aplicativo está em versão beta e pode gerar entidades incorretas ou incompletas. É altamente recomendável revisar manualmente as entidades geradas antes de usá-las em um projeto.
- Certifique-se de ter um backup adequado do banco de dados antes de executar o aplicativo.
- Este aplicativo foi projetado para funcionar com o PostgreSQL e utiliza o Sequelize como ORM. Certifique-se de ter o Sequelize instalado e configurado corretamente em seu projeto.
- Este aplicativo pressupõe que você já tenha configurado as dependências e estrutura básica de um projeto API Nest.js.

**Aviso:** Este aplicativo é fornecido "no estado em que se encontra", sem garantias expressas ou implícitas. O autor não se responsabiliza por quaisquer danos ou problemas causados pelo uso deste aplicativo.

Sinta-se à vontade para adicionar mais informações relevantes ou instruções específicas, conforme necessário.


# Entity Generation App for Nest.js API with Sequelize

[Versão em Português](#aplicativo-de-geração-de-entidades-para-api-nest.js-com-sequelize)

This is an application that automatically generates person entities in the format of a Nest.js API using Sequelize as the Object-Relational Mapping (ORM) tool for database integration. Please note that this application is still in beta version and may generate incorrect or incomplete entities.

## Database Configuration

Before running the application, you need to properly configure the database. Follow the steps below:

1. Install PostgreSQL on your system.
2. Create an empty database.
3. Open the `sequelize.js` file and configure the database connection information. Make sure to provide the correct database name, username, and password.

## Running the Application

Follow the steps below to run the application and generate person entities:

1. Install the application dependencies by running the command `npm install`.
2. Ensure that the database is properly configured according to the steps above.
3. Uncomment the line `generateEntities();` in the `index.js` file.
4. Run the application using the command `npm start`.
5. The application will query the database tables and generate person entities in the Nest.js format using Sequelize.
6. Check the `/entities` directory to find the generated files. Each entity will have its own directory containing the `.entity.ts` file and the `.provider.ts` file.

## Important

- Keep in mind that this application is still in beta version and may generate incorrect or incomplete entities. It is highly recommended to manually review the generated entities before using them in a project.
- Make sure to have an appropriate backup of the database before running the application.
- This application is designed to work with PostgreSQL and utilizes Sequelize as the ORM tool. Ensure that you have Sequelize installed and properly configured in your project.
- This application assumes that you have already set up the dependencies and basic structure of a Nest.js API project.

**Disclaimer:** This application is provided "as is," without warranty of any kind, express or implied. The author is not liable for any damages or issues caused by the use of this application.

Feel free to add more relevant information or specific instructions as needed.