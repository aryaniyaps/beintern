import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "~/components/ui/input";
import { api } from "~/utils/api";
import { Icons } from "../icons";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem } from "../ui/form";

const createMessageSchema = z.object({
  content: z
    .string({ required_error: "Please enter a message." })
    .min(1, { message: "Message must be atleast 1 character." })
    .max(250, { message: "Message cannot exceed 25 characters." }),
});

export default function MessageController({ roomId }: { roomId: string }) {
  const form = useForm<z.infer<typeof createMessageSchema>>({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      content: "",
    },
  });

  const createMessage = api.message.create.useMutation({});

  async function onSubmit(values: z.infer<typeof createMessageSchema>) {
    await createMessage.mutateAsync({ content: values.content, roomId });
    form.reset({ content: "" });
  }

  return (
    <Form {...form} data-testid="message-controller">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full gap-4"
      >
        <FormField
          name="content"
          control={form.control}
          render={({ field }) => (
            <FormItem className="w-full flex-grow">
              <FormControl>
                <Input placeholder="send a message..." {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          variant="ghost"
          type="submit"
          disabled={!form.formState.isValid}
        >
          <Icons.send size={20} className="h-4 w-4" />
        </Button>
      </form>
    </Form>
  );
}