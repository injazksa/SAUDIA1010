/**
 * WebMCP Tools Discovery
 * Provides AI agents with access to key website functions via WebMCP protocol
 * https://webmachinelearning.github.io/webmcp/
 */

(function() {
    // Check if navigator.modelContext is available (WebMCP support)
    if (!navigator.modelContext) {
        console.log('WebMCP not available in this browser');
        return;
    }

    // Define tools for AI agents
    const tools = [
        {
            name: 'get_visa_requirements',
            description: 'Get comprehensive visa requirements for Saudi Arabia including documents, medical checks, and processing times',
            inputSchema: {
                type: 'object',
                properties: {
                    profession_code: {
                        type: 'string',
                        description: 'The profession code (e.g., "111100" for Senior Managers)'
                    },
                    gender: {
                        type: 'string',
                        enum: ['ذكر', 'أنثى'],
                        description: 'Gender (ذكر for male, أنثى for female)'
                    }
                },
                required: ['profession_code']
            }
        },
        {
            name: 'search_professions',
            description: 'Search for eligible professions for Saudi work visa',
            inputSchema: {
                type: 'object',
                properties: {
                    keyword: {
                        type: 'string',
                        description: 'Search keyword (profession name in Arabic or English)'
                    },
                    category: {
                        type: 'string',
                        description: 'Profession category filter'
                    }
                },
                required: ['keyword']
            }
        },
        {
            name: 'get_office_info',
            description: 'Get information about our Saudi Embassy-licensed visa office',
            inputSchema: {
                type: 'object',
                properties: {}
            }
        },
        {
            name: 'get_visa_types',
            description: 'Get information about different types of Saudi visas',
            inputSchema: {
                type: 'object',
                properties: {
                    visa_type: {
                        type: 'string',
                        enum: ['work', 'tourist', 'family', 'umrah', 'business'],
                        description: 'Type of visa'
                    }
                }
            }
        },
        {
            name: 'get_blog_posts',
            description: 'Get latest blog posts about Saudi visa procedures',
            inputSchema: {
                type: 'object',
                properties: {
                    limit: {
                        type: 'number',
                        description: 'Number of posts to retrieve (default: 5)'
                    }
                }
            }
        }
    ];

    // Tool execution handlers
    async function executeTool(toolName, toolInput) {
        try {
            switch (toolName) {
                case 'get_visa_requirements':
                    return await getVisaRequirements(toolInput);
                case 'search_professions':
                    return await searchProfessions(toolInput);
                case 'get_office_info':
                    return await getOfficeInfo();
                case 'get_visa_types':
                    return await getVisaTypes(toolInput);
                case 'get_blog_posts':
                    return await getBlogPosts(toolInput);
                default:
                    return { error: `Unknown tool: ${toolName}` };
            }
        } catch (error) {
            return { error: error.message };
        }
    }

    // Tool implementations
    async function getVisaRequirements(input) {
        try {
            const response = await fetch('/professions.json');
            const professions = await response.json();
            const profession = professions.find(p => p.code === input.profession_code);
            
            if (!profession) {
                return { error: 'Profession not found' };
            }

            if (input.gender && profession.gender !== input.gender) {
                return { error: 'This profession is not available for the specified gender' };
            }

            return {
                profession: profession.name_ar,
                code: profession.code,
                category: profession.category,
                gender: profession.gender,
                requirements: profession.requirements
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    async function searchProfessions(input) {
        try {
            const response = await fetch('/professions.json');
            const professions = await response.json();
            
            const keyword = input.keyword.toLowerCase();
            const results = professions.filter(p => 
                p.name_ar.includes(keyword) || 
                p.profession_name_ar.includes(keyword) ||
                (input.category && p.category === input.category)
            ).slice(0, 10);

            return {
                count: results.length,
                professions: results.map(p => ({
                    code: p.code,
                    name: p.name_ar,
                    category: p.category,
                    gender: p.gender
                }))
            };
