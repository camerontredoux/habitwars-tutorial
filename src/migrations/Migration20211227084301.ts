import { Migration } from '@mikro-orm/migrations';

export class Migration20211227084301 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "post" ("_id" uuid not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "name" varchar(255) not null, "email" varchar(255) not null, "age" int4 null);');
    this.addSql('alter table "post" add constraint "post_pkey" primary key ("_id");');
  }

}
