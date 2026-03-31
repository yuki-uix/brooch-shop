-- CreateTable
CREATE TABLE "custom_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT,
    "image_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
