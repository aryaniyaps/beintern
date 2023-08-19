job "app" {
  datacenters = ["dc1"]

  group "app-group" {
    count = 1

    task "app" {
      driver = "docker"

      config {
        image = "aryaniyaps/securechat:latest"

        port_map {
          web = 3000
        }
      }

      env {
        DATABASE_URL              = "${database_url}"
        NEXTAUTH_SECRET           = "${nextauth_secret}"
        NEXTAUTH_URL              = "${nextauth_url}"
        NEXTAUTH_URL_INTERNAL     = "${nextauth_url_internal}"
        GOOGLE_CLIENT_ID          = "${google_client_id}"
        GOOGLE_CLIENT_SECRET      = "${google_client_secret}"
        EMAIL_SERVER              = "${email_server}"
        EMAIL_FROM                = "${email_from}"
        MINIO_ACCESS_KEY          = "${minio_access_key}"
        MINIO_SECRET_KEY          = "${minio_secret_key}"
        MINIO_END_POINT           = "${minio_end_point}"
        MINIO_PORT                = "${minio_port}"
        MINIO_USE_SSL             = "${minio_use_ssl}"
        MINIO_BUCKET_NAME         = "${minio_bucket_name}"
        CENTRIFUGO_URL            = "${centrifugo_url}"
        CENTRIFUGO_API_KEY        = "${centrifugo_api_key}"
      }

      resources {
        cpu    = 500 # Modify based on your needs
        memory = 512 # Modify based on your needs
        network {
          port "web" {}
        }
      }

      service {
        name = "app"
        tags = ["app"]
        port = "web"
        
        check {
          name     = "alive"
          type     = "tcp"
          interval = "10s"
          timeout  = "2s"
        }
      }
    }
  }
}
