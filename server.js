
#include <winsock2.h>
#include <windows.h>
#include <iostream>
#include <sstream>
#include <ctime>

#pragma comment(lib, "ws2_32.lib")

// Oddiy random funksiyasi
double randomOffset() {
    return ((rand() % 200) - 100) / 10000.0; // ±0.1° atrofida
}

// JSON string yasash (qo'lda)


 std::string buildJson() {
    double baseLat = 41.2995;
    double baseLon = 69.2401;

    double lat1 = baseLat + ((rand() % 200 - 100) / 10000.0);
    double lon1 = baseLon + ((rand() % 200 - 100) / 10000.0);
    double lat2 = baseLat + ((rand() % 200 - 100) / 10000.0);
    double lon2 = baseLon + ((rand() % 200 - 100) / 10000.0);
    double lat3 = baseLat + ((rand() % 200 - 100) / 10000.0);
    double lon3 = baseLon + ((rand() % 200 - 100) / 10000.0);

    std::ostringstream ss;
    ss << R"({ "type": "FeatureCollection", "features": [)";

    ss << "{ \"type\": \"Feature\", \"geometry\": { \"type\": \"Point\", \"coordinates\": ["
       << lon1 << "," << lat1 << "] }, \"properties\": { \"id\": 1, \"title\": \"Nuqta 1\", \"status\": \"online\", \"color\": \"blue\" } },";

    ss << "{ \"type\": \"Feature\", \"geometry\": { \"type\": \"Point\", \"coordinates\": ["
       << lon2 << "," << lat2 << "] }, \"properties\": { \"id\": 2, \"title\": \"Markaz Nuqta\", \"status\": \"online\", \"color\": \"red\" } },";

    ss << "{ \"type\": \"Feature\", \"geometry\": { \"type\": \"Point\", \"coordinates\": ["
       << lon3 << "," << lat3 << "] }, \"properties\": { \"id\": 3, \"title\": \"Nuqta 3\", \"status\": \"busy\", \"color\": \"gray\" } }";

    ss << "] }";
    return ss.str();
}


int main() {
    WSADATA wsa;
    SOCKET server_socket, client_socket;
    struct sockaddr_in server, client;
    int c;
    char buffer[1024];

    srand((unsigned)time(0));

    std::cout << "Server ishga tushmoqda...\n";

    WSAStartup(MAKEWORD(2, 2), &wsa);
    server_socket = socket(AF_INET, SOCK_STREAM, 0);

    server.sin_family = AF_INET;
    server.sin_addr.s_addr = INADDR_ANY;
    server.sin_port = htons(8080);

    bind(server_socket, (struct sockaddr*)&server, sizeof(server));
    listen(server_socket, 3);

    std::cout << "Tinglanmoqda: http://127.0.0.1:8080\n";

    c = sizeof(struct sockaddr_in);

    while (true) {
        client_socket = accept(server_socket, (struct sockaddr*)&client, &c);
        if (client_socket == INVALID_SOCKET) continue;

        recv(client_socket, buffer, sizeof(buffer), 0);

        // Asosiy koordinatalar
        double baseLat = 41.2995;
        double baseLon = 69.2401;

        // Har bir nuqta biroz harakat qiladi
        double lat1 = baseLat + randomOffset();
        double lon1 = baseLon + randomOffset();
        double lat2 = baseLat + randomOffset();
        double lon2 = baseLon + randomOffset();
        double lat3 = baseLat + randomOffset();
        double lon3 = baseLon + randomOffset();

        std::string json = buildJson(); //lat1, lon1, lat2, lon2, lat3, lon3

        std::ostringstream response;
        response << "HTTP/1.1 200 OK\r\n";
        response << "Content-Type: application/json\r\n";
        response << "Access-Control-Allow-Origin: *\r\n";
        response << "Content-Length: " << json.size() << "\r\n";
        response << "Connection: close\r\n\r\n";
        response << json;

        std::string out = response.str();
        send(client_socket, out.c_str(), out.size(), 0);
        closesocket(client_socket);

        Sleep(1000); // 1 sekund kutish
    }

    closesocket(server_socket);
    WSACleanup();
    return 0;
}
