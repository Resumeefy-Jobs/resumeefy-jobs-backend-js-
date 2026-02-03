import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Resumeefy API Documentation',
      version: '1.0.0',
      description: 'Complete API reference for the Resumeefy Job Board Platform',
      contact: {
        name: 'API Support',
        email: 'support@resumeefy.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Local Development Server',
      },
      {
        url: 'https://resumeefy-jobs-backend-js.onrender.com/api',
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: [
    './routes/*.js',          
    './src/routes/*.js',       
    '../routes/*.js',          
  ], 
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;