#pragma once
#include <cstddef>

// Downloads the live M4 HUB metadata catalog over HTTPS to a temporary file.
// TLS certificate verification is left enabled (no certificate-bypass callback).
// Returns 1 on HTTP 200 + completed write, otherwise 0 and writes a short status.
int m4hub_refresh_catalog(char* status, std::size_t status_size);
