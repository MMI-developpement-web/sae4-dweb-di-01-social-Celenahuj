<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260331095619 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE block ADD blocked_id INT NOT NULL');
        $this->addSql('ALTER TABLE block ADD CONSTRAINT FK_831B972221FF5136 FOREIGN KEY (blocked_id) REFERENCES `user` (id)');
        $this->addSql('CREATE INDEX IDX_831B972221FF5136 ON block (blocked_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE block DROP FOREIGN KEY FK_831B972221FF5136');
        $this->addSql('DROP INDEX IDX_831B972221FF5136 ON block');
        $this->addSql('ALTER TABLE block DROP blocked_id');
    }
}
