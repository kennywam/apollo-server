const http = require('http');

const API_URL = 'http://localhost:4000';

async function runQuery(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      query,
      variables,
    });

    const options = {
      hostname: 'localhost',
      port: 4000,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve(parsedData);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// We shall run the tests sequentially
async function runTests() {
  console.log('🧪 Starting API Tests');
  console.log('====================\n');

  try {
    // 1. Get all users
    console.log('1. Getting all users...');
    const usersResult = await runQuery(`
      query {
        users {
          id
          name
          email
        }
      }
    `);
    console.log('Users:', JSON.stringify(usersResult.data.users, null, 2));
    console.log('✅ Success: Retrieved all users\n');

    // Get the first user's ID for later use
    const firstUserId = usersResult.data.users[0].id;

    // 2. Get all tasks
    console.log('2. Getting all tasks...');
    const tasksResult = await runQuery(`
      query {
        tasks {
          id
          title
          status
          user {
            name
          }
        }
      }
    `);
    console.log('tasks:', JSON.stringify(tasksResult.data.tasks, null, 2));
    console.log('✅ Success: Retrieved all tasks\n');

    // 3. Get tasks by status
    console.log('3. Getting PENDING tasks...');
    const pendingtasksResult = await runQuery(`
      query {
        tasksByStatus(status: PENDING) {
          id
          title
          status
          user {
            name
          }
        }
      }
    `);
    console.log('Pending tasks:', JSON.stringify(pendingtasksResult.data.tasksByStatus, null, 2));
    console.log('✅ Success: Retrieved tasks by status\n');

    // 4. Create a new task (this will trigger the job queue)
    console.log(`4.  Creating a new task for user ${firstUserId}...`);
    const newtaskResult = await runQuery(`
      mutation {
        createTask(userId: "${firstUserId}", title: "Test job Queue") {
          id
          title
          status
          user {
            name
            email
          }
        }
      }
    `);
    console.log('New task:', JSON.stringify(newtaskResult.data.createtask, null, 2));
    console.log('✅ Success: Created new task (check worker console for email notification)\n');

    const newtaskId = newtaskResult.data.createtask.id;

    // 5. Update task status (this will trigger another job queue notification)
    console.log(`5. Updating task ${newtaskId} status to IN_PROGRESS...`);
    const updatetaskResult = await runQuery(`
      mutation {
        updateTaskStatus(id: "${newtaskId}", status: IN_PROGRESS) {
          id
          title
          status
        }
      }
    `);
    console.log('Updated task:', JSON.stringify(updatetaskResult.data.updatetaskStatus, null, 2));
    console.log('✅ Success: Updated task status (check worker console for email notification)\n');

    // 6. Create a new user(may break the second time...unique email)
    console.log('6. Creating a new user...');
    const newUserResult = await runQuery(`
      mutation {
        createUser(email: "test@example.com", name: "Test User") {
          id
          name
          email
        }
      }
    `);
    console.log('New User:', JSON.stringify(newUserResult.data.createUser, null, 2));
    console.log('✅ Success: Created new user\n');

    console.log('🎉 All tests completed successfully!');
    console.log('\nNotes:');
    console.log('- Check the worker terminal to see email notifications');
    console.log('- Visit http://localhost:4000 to explore the GraphQL playground');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

runTests();
