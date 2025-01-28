-- CreateTable
CREATE TABLE "TimerConfig"
(
    "id"        TEXT         NOT NULL,
    "name"      TEXT         NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimerConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimerBlock"
(
    "id"            TEXT    NOT NULL,
    "timerConfigId" TEXT    NOT NULL,
    "title"         TEXT    NOT NULL,
    "duration"      INTEGER NOT NULL,
    "notes"         TEXT    NOT NULL,
    "color"         TEXT    NOT NULL,
    "order"         INTEGER NOT NULL,

    CONSTRAINT "TimerBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TimerBlock_timerConfigId_idx" ON "TimerBlock" ("timerConfigId");

-- AddForeignKey
ALTER TABLE "TimerBlock"
    ADD CONSTRAINT "TimerBlock_timerConfigId_fkey"
        FOREIGN KEY ("timerConfigId") REFERENCES "TimerConfig" ("id")
            ON DELETE RESTRICT
            ON UPDATE CASCADE;
