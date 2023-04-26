import { User } from "../models/user.js";


export default function dataLoader() {
    User.sync()
      .then(() => {
        // Check if the User table is empty
        return User.count();
      })
      .then(count => {
        // If the User table is empty, add a default user
        if (count === 0) {
          User.create({
            username: 'admin@pop.com',
            password: '1234',
            role: 'admin',
            name: 'Admin'
          });
          User.create({
            username: 'sync.manager@pop.com',
            password: '1234',
            role: 'sync_manager',
            name: 'Sync Manager'
          });
          User.create({
            username: 'ticket.manager@pop.com',
            password: '1234',
            role: 'ticket_manager',
            name: 'Ticket Manager'
          });
        }
      })
      .catch(error => {
        console.error('Error syncing User table:', error);
      });
}

