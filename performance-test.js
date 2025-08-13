// Simple performance test script
const performanceTest = async () => {
    const testEndpoints = [
        '/api/questions?type=readingQuestions&part=5&testSet=1',
        '/api/questions?type=readingQuestions&part=6',
        '/api/questions?type=readingQuestions&part=7',
        '/api/data'
    ];

    console.log('🚀 Starting Performance Test...\n');

    for (const endpoint of testEndpoints) {
        const url = `http://localhost:3000${endpoint}`;
        console.log(`Testing: ${endpoint}`);

        const times = [];

        // Test 3 times for each endpoint
        for (let i = 0; i < 3; i++) {
            const startTime = Date.now();

            try {
                const response = await fetch(url);
                const endTime = Date.now();
                const duration = endTime - startTime;

                if (response.ok) {
                    const data = await response.json();
                    times.push(duration);
                    console.log(`  Attempt ${i + 1}: ${duration}ms (${data.total || data.data?.length || 0} items)`);
                } else {
                    console.log(`  Attempt ${i + 1}: Failed (${response.status})`);
                }
            } catch (error) {
                console.log(`  Attempt ${i + 1}: Error - ${error.message}`);
            }
        }

        if (times.length > 0) {
            const avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
            const minTime = Math.min(...times);
            const maxTime = Math.max(...times);

            console.log(`  📊 Average: ${avgTime}ms | Min: ${minTime}ms | Max: ${maxTime}ms`);
        }

        console.log('');
    }

    console.log('✅ Performance test completed!');
};

// Run the test
performanceTest().catch(console.error);
