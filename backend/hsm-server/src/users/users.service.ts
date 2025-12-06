import { Injectable } from '@nestjs/common';

//TODO: must be declared and moved to seperate folders
export type User = {
  userId: number;
  userName: string;
  password: string;
};
@Injectable()
export class UsersService {
  //TODO: whole class must be use the db setup for user crud
  private readonly Users: User[] = [
    { userId: 1, userName: 'john', password: 'changeme' },
  ];

  findOne(userName: string): User | undefined {
    return this.Users.find((user) => user.userName === userName);
  }
}
