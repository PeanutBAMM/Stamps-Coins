import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Sentry Feedback Loop for Anti Gravity IDE
 * 
 * Fetches recent issues from Sentry for the 'react-native' project
 * within the 'peanut-ventures' organization.
 */

// Helper to load simple .env files
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            content.split('\n').forEach((line: string) => {
                const [key, value] = line.split('=');
                if (key && value) {
                    process.env[key.trim()] = value.trim();
                }
            });
        }
    } catch (e) {
        // Ignore errors
    }
}

loadEnv();

const CONFIG = {
    org: 'peanut-ventures',
    project: 'react-native',
    token: process.env.SENTRY_AUTH_TOKEN,
    baseUrl: 'https://sentry.io/api/0',
    env: process.argv.includes('--test') ? 'test' : process.argv.includes('--prod') ? 'production' : undefined,
};

async function getRecentIssues() {
    if (!CONFIG.token) {
        console.error('❌ SENTRY_AUTH_TOKEN is not set in environment.');
        return;
    }

    const envLabel = CONFIG.env ? `[${CONFIG.env.toUpperCase()}] ` : '';
    console.log(`🔍 Fetching ${envLabel}issues for project: ${CONFIG.project}...`);

    try {
        const response = await axios.get(
            `${CONFIG.baseUrl}/projects/${CONFIG.org}/${CONFIG.project}/issues/`,
            {
                headers: {
                    Authorization: `Bearer ${CONFIG.token}`,
                },
                params: {
                    statsPeriod: '24h',
                    limit: 50,
                    query: CONFIG.env ? `environment:${CONFIG.env}` : 'is:unresolved',
                },
            }
        );

        const issues = response.data;

        if (issues.length === 0) {
            console.log(`✅ No unresolved ${CONFIG.env || ''} issues found in the last 24 hours.`);
            return;
        }

        console.log(`\n--- Recent Sentry Issues (${issues.length}) ---`);
        issues.slice(0, 8).forEach((issue: any) => {
            const level = issue.level.toUpperCase();
            const time = new Date(issue.lastSeen).toLocaleTimeString();
            const aiContext = issue.tags?.find((t: any) => t.key === 'ai.context')?.value || 'N/A';

            console.log(`[${level}] ${issue.title} (${time})`);
            console.log(`  AI Context: ${aiContext}`);
            if (issue.culprit) console.log(`  Location: ${issue.culprit}`);
            if (issue.metadata && issue.metadata.value) {
                console.log(`  Detail: ${issue.metadata.value}`);
            }
            console.log(`  URL: ${issue.permalink}`);
            console.log('');
        });

        if (issues.length > 5) {
            console.log(`... and ${issues.length - 5} more.`);
        }

    } catch (error: any) {
        if (error.response) {
            console.error(`❌ Sentry API Error: ${error.response.status} ${error.response.data.detail || error.response.statusText}`);
        } else {
            console.error(`❌ Error connecting to Sentry: ${error.message}`);
        }
    }
}

getRecentIssues();
