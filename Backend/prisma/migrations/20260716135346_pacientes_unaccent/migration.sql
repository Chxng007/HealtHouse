-- Búsqueda de pacientes insensible a acentos (RF-PAC-02).
-- La extensión unaccent permite que "maria" encuentre "María" en el servicio de pacientes
-- (pacientes.service.js usa unaccent(...) ILIKE unaccent(...) vía $queryRaw).
CREATE EXTENSION IF NOT EXISTS unaccent;
