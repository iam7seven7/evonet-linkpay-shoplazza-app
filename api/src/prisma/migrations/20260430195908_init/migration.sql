-- CreateTable
CREATE TABLE "stores" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "store_name" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_at" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "store_id" TEXT,
    "merchant_no" TEXT NOT NULL,
    "sign_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "shoplazza_id" TEXT NOT NULL,
    "linkpay_id" TEXT,
    "store_id" TEXT,
    "merchant_no" TEXT NOT NULL,
    "cancel_url" TEXT,
    "return_url" TEXT,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refund" (
    "id" TEXT NOT NULL,
    "shoplazza_id" TEXT NOT NULL,
    "linkpay_id" TEXT,
    "store_id" TEXT,
    "merchant_no" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refund_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stores_store_id_key" ON "stores"("store_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_merchant_no_key" ON "accounts"("merchant_no");

-- CreateIndex
CREATE INDEX "payments_store_id_idx" ON "payments"("store_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_created_at_idx" ON "payments"("created_at");

-- CreateIndex
CREATE INDEX "payments_updated_at_idx" ON "payments"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "payments_shoplazza_id_key" ON "payments"("shoplazza_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_linkpay_id_key" ON "payments"("linkpay_id");

-- CreateIndex
CREATE INDEX "refund_store_id_idx" ON "refund"("store_id");

-- CreateIndex
CREATE INDEX "refund_status_idx" ON "refund"("status");

-- CreateIndex
CREATE INDEX "refund_created_at_idx" ON "refund"("created_at");

-- CreateIndex
CREATE INDEX "refund_updated_at_idx" ON "refund"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "refund_shoplazza_id_key" ON "refund"("shoplazza_id");

-- CreateIndex
CREATE UNIQUE INDEX "refund_linkpay_id_key" ON "refund"("linkpay_id");
