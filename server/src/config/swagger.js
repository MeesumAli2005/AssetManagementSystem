import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Asset Management System API',
      version: '1.0.0',
      description:
        'REST API for the Asset Management and Tracking System — authentication, employee/admin accounts, asset categories, asset inventory, and supporting document uploads.',
    },
    servers: 
    [
      { url: 'http://172.20.2.224:5000', description: 'Local dev server' },
    ],

    components: 
    {
      securitySchemes: 
      {

        bearerAuth: 
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Paste the JWT returned by /api/auth/login (without the "Bearer " prefix).',
        },

      },

      schemas: 
      {
        Error: 
        {
          type: 'object',
          properties: 
          {
            message: { type: 'string' },
          },

        },

        User: 
        {
          type: 'object',
          properties: 
          {
            id: { type: 'integer' },
            full_name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['employee', 'administrator'] },
          },

        },

        AuthResponse: 
        {
          type: 'object',
          properties: 
          {
            token: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
          },

        },

        CategorySpec: 
        {
          type: 'object',
          properties: 
          {
            id: { type: 'integer' },
            category_id: { type: 'integer' },
            spec_name: { type: 'string' },
            spec_type: { type: 'string', enum: ['text', 'number', 'boolean', 'dropdown'] },
            is_required: { type: 'boolean' },
          },

        },

        Category: 
        {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            specs: {
              type: 'array',
              items: { $ref: '#/components/schemas/CategorySpec' },
            },
          },

        },

        SpecValue: 
        {
          type: 'object',
          required: ['category_spec_id', 'value'],
          properties: {
            category_spec_id: { type: 'integer' },
            value: { type: 'string' },
          },

        },

        Asset: 
        {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            asset_tag: { type: 'string' },
            name: { type: 'string' },
            category_id: { type: 'integer' },
            category_name: { type: 'string' },
            purchase_date: { type: 'string', format: 'date' },
            purchase_cost: { type: 'number' },
            status: { type: 'string', enum: ['available', 'assigned', 'under_repair', 'retired'] },
            condition: { type: 'string', enum: ['new', 'good', 'fair', 'damaged'] },
            current_assignee_id: { type: 'integer', nullable: true },
            current_assignee_name: { type: 'string', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },

        },


        AssetHistoryEntry: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            performed_by: { type: 'integer', nullable: true },
            performed_by_name: { type: 'string', nullable: true },
            event_type: {
              type: 'string',
              enum: ['purchase', 'assignment', 'return', 'repair', 'status_change', 'condition_change', 'retirement'],
            },
            description: { type: 'string' },
            asset_id: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        AssetDocument: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            asset_id: { type: 'integer' },
            document_type: { type: 'string', enum: ['receipt', 'repair_record', 'other'] },
            file_url: { type: 'string' },
            uploaded_by: { type: 'integer', nullable: true },
            uploaded_by_name: { type: 'string', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        AssetDetail: {
          allOf: [
            { $ref: '#/components/schemas/Asset' },
            {
              type: 'object',
              properties: {
                history: { type: 'array', items: { $ref: '#/components/schemas/AssetHistoryEntry' } },
                documents: { type: 'array', items: { $ref: '#/components/schemas/AssetDocument' } },
                spec_values: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'integer' },
                      category_spec_id: { type: 'integer' },
                      value: { type: 'string' },
                      spec_name: { type: 'string' },
                      spec_type: { type: 'string' },
                    },
                  },
                },
              },
            },
          ],
        },
      },
    },
    // Every endpoint requires a bearer token by default; routes that don't
    // (signup, login) override this with `security: []` in their own JSDoc block.
    
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
