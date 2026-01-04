import { spawn, execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Android Test Orchestrator for Anti Gravity IDE
 * 
 * This script handles:
 * 1. Starting/Connecting to an Android Emulator
 * 2. Running Jest tests
 * 3. Reporting results
 * 
 * Usage: npx ts-node scripts/test-orchestrator.ts [--avd Name] [--no-emulator]
 */

const CONFIG = {
    emulatorPath: 'C:\\Users\\peanu\\AppData\\Local\\Android\\Sdk\\emulator\\emulator.exe',
    maestroPath: 'C:\\Users\\peanu\\maestro\\maestro\\bin\\maestro.bat',
    javaHome: 'C:\\Program Files\\Android\\Android Studio\\jbr',
    defaultAvd: 'Pixel_6',
    bootTimeoutMs: 120000, // 2 minutes
    checkIntervalMs: 5000,
};

// Set JAVA_HOME for the process
process.env.JAVA_HOME = CONFIG.javaHome;
process.env.PATH = `${path.join(CONFIG.javaHome, 'bin')}${path.delimiter}${process.env.PATH}`;

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isEmulatorRunning(): boolean {
    try {
        const output = execSync('adb devices').toString();
        // Look for 'emulator-XXXX' or '127.0.0.1:XXXX'
        return /emulator-\d+|127\.0\.0\.1:\d+/.test(output) && output.includes('\tdevice');
    } catch {
        return false;
    }
}

function startEmulator(avdName: string, headless: boolean = true) {
    console.log(`🚀 Starting emulator: ${avdName}${headless ? ' (headless)' : ''}...`);

    if (process.platform === 'win32' && !headless) {
        // Use Start-Process to ensure the window is surfaced on the user's desktop
        const command = `Start-Process -FilePath '${CONFIG.emulatorPath}' -ArgumentList '-avd','${avdName}','-no-snapshot' -WindowStyle Normal`;
        execSync(`powershell -Command "${command}"`);
    } else {
        const args = ['-avd', avdName, '-no-snapshot'];
        if (headless) {
            args.push('-no-window');
        }
        const child = spawn(CONFIG.emulatorPath, args, {
            detached: true,
            stdio: 'ignore'
        });
        child.unref();
    }
}

async function waitForBoot() {
    console.log('⏳ Waiting for emulator to boot...');
    const start = Date.now();

    while (Date.now() - start < CONFIG.bootTimeoutMs) {
        try {
            const output = execSync('adb shell getprop sys.boot_completed').toString().trim();
            if (output === '1') {
                console.log('✅ Emulator booted!');
                return true;
            }
        } catch {
            // adb might not be ready yet
        }
        await sleep(CONFIG.checkIntervalMs);
    }

    throw new Error('❌ Timeout waiting for emulator to boot.');
}

async function runTests() {
    console.log('🧪 Running Jest tests...');
    try {
        execSync('npm test', { stdio: 'inherit' });
        console.log('✅ Unit/Integration tests passed!');
        return true;
    } catch (error) {
        console.error('❌ Unit/Integration tests failed.');
        return false;
    }
}

async function runMaestroTests() {
    console.log('🎬 Running Maestro E2E tests...');
    try {
        // Try to run maestro using the absolute path
        execSync(`"${CONFIG.maestroPath}" test .maestro/happy-path.yaml`, { stdio: 'inherit' });
        console.log('✅ E2E tests passed!');
        return true;
    } catch (error) {
        console.error('⚠️ Maestro E2E tests failed or Maestro is not installed correctly.');
        return false;
    }
}

async function main() {
    const args = process.argv;
    const fullArgsStr = args.join(' ');
    console.log(`Debug: fullArgsStr = ${fullArgsStr}`);

    const avdName = fullArgsStr.includes('--avd') ? args[args.indexOf('--avd') + 1] : CONFIG.defaultAvd;
    const skipEmulator = fullArgsStr.includes('--no-emulator');
    const headless = !fullArgsStr.includes('--head');

    console.log(`Debug: avdName=${avdName}, skipEmulator=${skipEmulator}, headless=${headless}`);

    try {
        if (!skipEmulator && !isEmulatorRunning()) {
            startEmulator(avdName, headless);
            await waitForBoot();
        } else if (isEmulatorRunning()) {
            console.log('📱 Emulator already running.');
        }

        const jestSuccess = await runTests();
        const maestroSuccess = await runMaestroTests();
        const overallSuccess = jestSuccess && maestroSuccess;

        // Potential Sentry integration point
        console.log('\n--- Pipeline Summary ---');
        console.log(`Jest Status:    ${jestSuccess ? 'PASSED' : 'FAILED'}`);
        console.log(`Maestro Status: ${maestroSuccess ? 'PASSED' : 'FAILED'}`);
        console.log(`Overall Status: ${overallSuccess ? 'PASSED' : 'FAILED'}`);

        if (!overallSuccess) {
            console.log('\n(Tip) Run "npm run sentry:feedback" to see if any new issues were logged in Sentry.');
        }

        process.exit(overallSuccess ? 0 : 1);
    } catch (error: any) {
        console.error(`💥 Pipeline error: ${error.message}`);
        process.exit(1);
    }
}

main();
