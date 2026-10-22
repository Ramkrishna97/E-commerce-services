CREATE DATABASE IF NOT EXISTS user_db CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE user_db;

CREATE TABLE users (
  id BINARY(16) NOT NULL, email VARCHAR(320) NOT NULL, password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL, last_name VARCHAR(100) NOT NULL, phone VARCHAR(32),
  status ENUM('PENDING_VERIFICATION','ACTIVE','LOCKED','DISABLED') NOT NULL DEFAULT 'PENDING_VERIFICATION',
  mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE, token_version INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id), UNIQUE KEY uk_users_email (email), UNIQUE KEY uk_users_phone (phone), KEY ix_users_status (status)
) ENGINE=InnoDB;
CREATE TABLE roles (id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT, name VARCHAR(64) NOT NULL, PRIMARY KEY(id), UNIQUE KEY uk_roles_name(name)) ENGINE=InnoDB;
CREATE TABLE user_roles (user_id BINARY(16) NOT NULL, role_id SMALLINT UNSIGNED NOT NULL, PRIMARY KEY(user_id,role_id), CONSTRAINT fk_ur_user FOREIGN KEY(user_id) REFERENCES users(id), CONSTRAINT fk_ur_role FOREIGN KEY(role_id) REFERENCES roles(id)) ENGINE=InnoDB;
CREATE TABLE addresses (
  id BINARY(16) NOT NULL, user_id BINARY(16) NOT NULL, label VARCHAR(50), recipient_name VARCHAR(200) NOT NULL, recipient_phone VARCHAR(32) NOT NULL,
  line1 VARCHAR(255) NOT NULL, line2 VARCHAR(255), city VARCHAR(100) NOT NULL, state VARCHAR(100) NOT NULL, postal_code VARCHAR(20) NOT NULL, country_code CHAR(2) NOT NULL,
  latitude DECIMAL(10,7), longitude DECIMAL(10,7), is_default BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY(id), KEY ix_addresses_user(user_id), CONSTRAINT fk_addresses_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE TABLE refresh_tokens (id BINARY(16) NOT NULL, user_id BINARY(16) NOT NULL, token_hash CHAR(64) NOT NULL, expires_at TIMESTAMP(6) NOT NULL, revoked_at TIMESTAMP(6), created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY(id), UNIQUE KEY uk_refresh_token_hash(token_hash), KEY ix_refresh_user(user_id), KEY ix_refresh_expiry(expires_at), CONSTRAINT fk_refresh_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB;
CREATE TABLE mfa_factors (id BINARY(16) NOT NULL, user_id BINARY(16) NOT NULL, factor_type ENUM('TOTP','SMS','EMAIL') NOT NULL, secret_ciphertext VARBINARY(1024) NOT NULL, verified_at TIMESTAMP(6), created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY(id), UNIQUE KEY uk_mfa_user_type(user_id,factor_type), CONSTRAINT fk_mfa_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE) ENGINE=InnoDB;
CREATE TABLE outbox_event (id BINARY(16) NOT NULL, aggregate_type VARCHAR(80) NOT NULL, aggregate_id BINARY(16) NOT NULL, event_type VARCHAR(120) NOT NULL, payload JSON NOT NULL, occurred_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), published_at TIMESTAMP(6), attempts INT NOT NULL DEFAULT 0, PRIMARY KEY(id), KEY ix_outbox_unpublished(published_at,occurred_at)) ENGINE=InnoDB;
