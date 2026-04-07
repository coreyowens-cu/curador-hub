CREATE TABLE "email_allowlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"added_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_allowlist_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "email_allowlist" ADD CONSTRAINT "email_allowlist_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;