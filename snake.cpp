#include <iostream>
#include <vector>
#include <deque>
#include <cstdlib>
#include <ctime>
#include <conio.h>
#include <windows.h>

// Board Dimensions
constexpr int BOARD_WIDTH = 40;
constexpr int BOARD_HEIGHT = 20;

// Direction Enumeration
enum class Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT,
    NONE
};

// Game State Enumeration
enum class GameState {
    PLAYING,
    GAME_OVER,
    QUIT
};

// Position Structure
struct Position {
    int x;
    int y;

    bool operator==(const Position& other) const {
        return x == other.x && y == other.y;
    }
};

// Snake Class
class Snake {
private:
    std::deque<Position> body;
    Direction dir;
    Direction nextDir;
    bool growPending;

public:
    Snake(int startX, int startY) {
        reset(startX, startY);
    }

    void reset(int startX, int startY) {
        body.clear();
        body.push_back({ startX, startY });
        body.push_back({ startX - 1, startY });
        body.push_back({ startX - 2, startY });
        dir = Direction::RIGHT;
        nextDir = Direction::RIGHT;
        growPending = false;
    }

    Direction getDirection() const { return dir; }

    void setDirection(Direction newDir) {
        // Prevent 180-degree reverse movement into self
        if ((dir == Direction::UP && newDir == Direction::DOWN) ||
            (dir == Direction::DOWN && newDir == Direction::UP) ||
            (dir == Direction::LEFT && newDir == Direction::RIGHT) ||
            (dir == Direction::RIGHT && newDir == Direction::LEFT)) {
            return;
        }
        nextDir = newDir;
    }

    Position getHead() const {
        return body.front();
    }

    const std::deque<Position>& getBody() const {
        return body;
    }

    void move() {
        dir = nextDir;
        Position head = getHead();

        switch (dir) {
            case Direction::UP:    head.y--; break;
            case Direction::DOWN:  head.y++; break;
            case Direction::LEFT:  head.x--; break;
            case Direction::RIGHT: head.x++; break;
            default: break;
        }

        body.push_front(head);

        if (!growPending) {
            body.pop_back();
        } else {
            growPending = false;
        }
    }

    void grow() {
        growPending = true;
    }

    bool checkSelfCollision() const {
        Position head = getHead();
        // Check if head collides with any body segment (excluding head itself)
        for (size_t i = 1; i < body.size(); ++i) {
            if (body[i] == head) {
                return true;
            }
        }
        return false;
    }

    bool isOccupying(const Position& pos) const {
        for (const auto& segment : body) {
            if (segment == pos) return true;
        }
        return false;
    }
};

// Food Class
class Food {
private:
    Position pos;

public:
    Food() : pos{ 0, 0 } {}

    Position getPosition() const { return pos; }

    void generateFood(const Snake& snake) {
        bool validPosition = false;
        while (!validPosition) {
            pos.x = std::rand() % BOARD_WIDTH;
            pos.y = std::rand() % BOARD_HEIGHT;
            // Ensure food does not spawn inside the snake's body
            if (!snake.isOccupying(pos)) {
                validPosition = true;
            }
        }
    }
};

// Game Controller Class
class Game {
private:
    Snake snake;
    Food food;
    int score;
    int highScore;
    GameState state;
    HANDLE hConsole;

    void setCursorPosition(int x, int y) {
        COORD coord = { static_cast<SHORT>(x), static_cast<SHORT>(y) };
        SetConsoleCursorPosition(hConsole, coord);
    }

    void setColor(WORD color) {
        SetConsoleTextAttribute(hConsole, color);
    }

    void hideCursor() {
        CONSOLE_CURSOR_INFO cursorInfo;
        GetConsoleCursorInfo(hConsole, &cursorInfo);
        cursorInfo.bVisible = FALSE;
        SetConsoleCursorInfo(hConsole, &cursorInfo);
    }

public:
    Game() 
        : snake(BOARD_WIDTH / 2, BOARD_HEIGHT / 2),
          score(0), 
          highScore(0), 
          state(GameState::PLAYING) {
        hConsole = GetStdHandle(STD_OUTPUT_HANDLE);
        std::srand(static_cast<unsigned int>(std::time(nullptr)));
        hideCursor();
    }

    void initializeGame() {
        snake.reset(BOARD_WIDTH / 2, BOARD_HEIGHT / 2);
        food.generateFood(snake);
        score = 0;
        state = GameState::PLAYING;
        system("cls");
    }

    void input() {
        if (!_kbhit()) return;

        int key = _getch();

        // Arrow keys prefix code (0 or 224 in Windows console)
        if (key == 0 || key == 224) {
            key = _getch();
            switch (key) {
                case 72: snake.setDirection(Direction::UP); break;    // Up Arrow
                case 80: snake.setDirection(Direction::DOWN); break;  // Down Arrow
                case 75: snake.setDirection(Direction::LEFT); break;  // Left Arrow
                case 77: snake.setDirection(Direction::RIGHT); break; // Right Arrow
            }
        } else {
            // WASD controls (case-insensitive) and quit/restart controls
            switch (key) {
                case 'w': case 'W': snake.setDirection(Direction::UP); break;
                case 's': case 'S': snake.setDirection(Direction::DOWN); break;
                case 'a': case 'A': snake.setDirection(Direction::LEFT); break;
                case 'd': case 'D': snake.setDirection(Direction::RIGHT); break;
                case 'q': case 'Q': case 27: // 'Q' or ESC to quit
                    state = GameState::QUIT;
                    break;
                case 'r': case 'R': // 'R' to restart
                    if (state == GameState::GAME_OVER) {
                        initializeGame();
                    }
                    break;
            }
        }
    }

    void updateGame() {
        if (state != GameState::PLAYING) return;

        snake.move();
        checkCollision();
    }

    void checkCollision() {
        Position head = snake.getHead();

        // 1. Wall collision check
        if (head.x < 0 || head.x >= BOARD_WIDTH || head.y < 0 || head.y >= BOARD_HEIGHT) {
            gameOver();
            return;
        }

        // 2. Self-collision check
        if (snake.checkSelfCollision()) {
            gameOver();
            return;
        }

        // 3. Food collision check
        if (head == food.getPosition()) {
            snake.grow();
            score += 10;
            if (score > highScore) {
                highScore = score;
            }
            food.generateFood(snake);
        }
    }

    void gameOver() {
        state = GameState::GAME_OVER;
    }

    void drawBoard() {
        setCursorPosition(0, 0);

        // Header Title
        setColor(14); // Yellow
        std::cout << "========================================\n";
        std::cout << "              SNAKE GAME                \n";
        std::cout << "========================================\n";

        // Score display
        setColor(11); // Light Cyan
        std::cout << " Score: " << score << "   |   High Score: " << highScore << "       \n";

        // Top Border
        setColor(9); // Blue
        std::cout << "+";
        for (int i = 0; i < BOARD_WIDTH; ++i) std::cout << "-";
        std::cout << "+\n";

        Position head = snake.getHead();
        Position foodPos = food.getPosition();
        const auto& body = snake.getBody();

        // Board Grid
        for (int y = 0; y < BOARD_HEIGHT; ++y) {
            setColor(9); // Left border
            std::cout << "|";

            for (int x = 0; x < BOARD_WIDTH; ++x) {
                Position currentPos{ x, y };

                if (currentPos == head) {
                    setColor(10); // Bright Green for Snake Head
                    std::cout << "O";
                } else if (currentPos == foodPos) {
                    setColor(12); // Bright Red for Food
                    std::cout << "*";
                } else {
                    bool isBody = false;
                    for (size_t i = 1; i < body.size(); ++i) {
                        if (body[i] == currentPos) {
                            setColor(2); // Green for Snake Body
                            std::cout << "o";
                            isBody = true;
                            break;
                        }
                    }
                    if (!isBody) {
                        std::cout << " ";
                    }
                }
            }

            setColor(9); // Right border
            std::cout << "|\n";
        }

        // Bottom Border
        setColor(9);
        std::cout << "+";
        for (int i = 0; i < BOARD_WIDTH; ++i) std::cout << "-";
        std::cout << "+\n";

        // Controls and Status Prompt
        if (state == GameState::PLAYING) {
            setColor(7); // White
            std::cout << " Controls: WASD or Arrow Keys | Q: Quit  \n";
        } else if (state == GameState::GAME_OVER) {
            setColor(12); // Bright Red
            std::cout << "                GAME OVER!               \n";
            setColor(14); // Yellow
            std::cout << " Final Score: " << score << "                            \n";
            setColor(15); // Bright White
            std::cout << " Press [R] to Restart  |  Press [Q] to Exit \n";
        }
    }

    void run() {
        initializeGame();

        while (state != GameState::QUIT) {
            input();
            
            if (state == GameState::PLAYING) {
                updateGame();
            }

            drawBoard();
            Sleep(90); // Controls game speed (90ms)
        }

        // Exit Screen
        setCursorPosition(0, BOARD_HEIGHT + 7);
        setColor(7);
        std::cout << "\nThanks for playing SNAKE GAME! Goodbye.\n";
    }
};

int main() {
    Game game;
    game.run();
    return 0;
}
