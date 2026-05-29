const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5000;

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'GitInsight Pro API',
            version: '1.0.0',
            description: 'A production-level Node.js, Express, and MySQL backend to analyze GitHub user profiles, compute scores, and cache insights.',
            contact: {
                name: 'Asus User',
                email: 'developer@example.com'
            }
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Local development server'
            }
        ],
        components: {
            schemas: {
                DeveloperProfile: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        username: { type: 'string', example: 'octocat' },
                        name: { type: 'string', example: 'The Octocat' },
                        bio: { type: 'string', example: 'Testing branch...' },
                        followers: { type: 'integer', example: 9800 },
                        following: { type: 'integer', example: 9 },
                        public_repos: { type: 'integer', example: 8 },
                        total_stars: { type: 'integer', example: 3450 },
                        top_languages: { type: 'string', example: 'HTML, CSS, JavaScript' },
                        developer_score: { type: 'integer', example: 46666 },
                        avatar_url: { type: 'string', example: 'https://avatars.githubusercontent.com/u/5832347?v=4' },
                        profile_url: { type: 'string', example: 'https://github.com/octocat' },
                        created_at: { type: 'string', format: 'date-time', example: '2026-05-28T09:12:00.000Z' }
                    }
                },
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Operation completed successfully.' },
                        data: { type: 'object' }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Resource not found.' },
                                code: { type: 'string', example: 'NOT_FOUND' },
                                details: { type: 'object', nullable: true }
                            }
                        }
                    }
                }
            }
        }
    },
    // Scan these files for route annotations
    apis: ['./src/routes/*.js', './src/app.js']
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
    // Serve swagger docs
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    
    // Serve raw swagger JSON spec as an alternative
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
    
    console.log('📖 Swagger UI initialized at /api-docs');
}

module.exports = setupSwagger;
