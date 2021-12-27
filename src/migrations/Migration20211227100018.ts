import { Migration } from '@mikro-orm/migrations';

export class Migration20211227100018 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "post" ("_id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "name" varchar(255) not null, "email" varchar(255) not null, "title" varchar(255) not null);');
  }

}
