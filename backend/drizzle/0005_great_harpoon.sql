ALTER TABLE "income" ALTER COLUMN "description" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "income" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "expense" ALTER COLUMN "description" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "expense" ALTER COLUMN "description" SET NOT NULL;