import { Field, InputType } from "type-graphql";

@InputType()
export default class UserArguments {
  @Field()
  username: string;

  @Field()
  password: string;

  @Field()
  email: string;
}
