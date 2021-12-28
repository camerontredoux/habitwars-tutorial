import { Migration } from '@mikro-orm/migrations';

export class Migration20211228004828 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "post" rename column "_id" to "id";');
  }

}
