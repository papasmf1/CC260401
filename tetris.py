import pygame
import random
import sys

# --- 상수 ---
SCREEN_W, SCREEN_H = 400, 700
BOARD_W, BOARD_H = 10, 20
CELL = 30
BOARD_X = (SCREEN_W - BOARD_W * CELL) // 2  # 55
BOARD_Y = 50

FPS = 60
FALL_INTERVAL = 500   # ms
FAST_FALL = 50        # ms (소프트드롭)

BLACK  = (0,   0,   0)
GRAY   = (40,  40,  40)
DGRAY  = (80,  80,  80)
WHITE  = (255, 255, 255)

COLORS = [
    None,
    (0,   240, 240),  # I - 시안
    (0,   0,   240),  # J - 파랑
    (240, 160,  0),   # L - 주황
    (240, 240,  0),   # O - 노랑
    (0,   240,  0),   # S - 초록
    (160,  0,  240),  # T - 보라
    (240,  0,   0),   # Z - 빨강
]

# 테트로미노 모양 (각 피스 = 회전 상태 목록)
SHAPES = [
    None,
    # I
    [[(0,1),(1,1),(2,1),(3,1)],
     [(1,0),(1,1),(1,2),(1,3)]],
    # J
    [[(0,0),(0,1),(1,1),(2,1)],
     [(1,0),(2,0),(1,1),(1,2)],
     [(0,1),(1,1),(2,1),(2,2)],
     [(1,0),(1,1),(1,2),(0,2)]],
    # L
    [[(2,0),(0,1),(1,1),(2,1)],
     [(1,0),(1,1),(1,2),(2,2)],
     [(0,1),(1,1),(2,1),(0,2)],
     [(0,0),(1,0),(1,1),(1,2)]],
    # O
    [[(1,0),(2,0),(1,1),(2,1)]],
    # S
    [[(1,0),(2,0),(0,1),(1,1)],
     [(1,0),(1,1),(2,1),(2,2)]],
    # T
    [[(1,0),(0,1),(1,1),(2,1)],
     [(1,0),(1,1),(2,1),(1,2)],
     [(0,1),(1,1),(2,1),(1,2)],
     [(1,0),(0,1),(1,1),(1,2)]],
    # Z
    [[(0,0),(1,0),(1,1),(2,1)],
     [(2,0),(1,1),(2,1),(1,2)]],
]

SCORE_TABLE = {1: 100, 2: 300, 3: 500, 4: 800}


class Piece:
    def __init__(self, kind=None):
        self.kind = kind or random.randint(1, 7)
        self.rot  = 0
        self.x    = 3
        self.y    = 0

    def cells(self, dx=0, dy=0, rot=None):
        r = self.rot if rot is None else rot
        return [(self.x + cx + dx, self.y + cy + dy)
                for cx, cy in SHAPES[self.kind][r % len(SHAPES[self.kind])]]


class TetrisGame:
    def __init__(self):
        pygame.init()
        self.screen = pygame.display.set_mode((SCREEN_W, SCREEN_H))
        pygame.display.set_caption("테트리스")
        self.clock  = pygame.time.Clock()
        self.font_l = pygame.font.SysFont("Arial", 36, bold=True)
        self.font_m = pygame.font.SysFont("Arial", 24, bold=True)
        self.font_s = pygame.font.SysFont("Arial", 18)
        self.reset()

    def reset(self):
        self.board    = [[0] * BOARD_W for _ in range(BOARD_H)]
        self.score    = 0
        self.level    = 1
        self.lines    = 0
        self.piece    = Piece()
        self.next     = Piece()
        self.game_over= False
        self.paused   = False
        self.fall_timer = 0

    # ── 충돌 검사 ──────────────────────────────────────────
    def valid(self, cells):
        for x, y in cells:
            if x < 0 or x >= BOARD_W or y >= BOARD_H:
                return False
            if y >= 0 and self.board[y][x]:
                return False
        return True

    # ── 피스 고정 & 줄 제거 ────────────────────────────────
    def lock(self):
        for x, y in self.piece.cells():
            if y < 0:
                self.game_over = True
                return
            self.board[y][x] = self.piece.kind

        cleared = [i for i in range(BOARD_H) if all(self.board[i])]
        for i in cleared:
            del self.board[i]
            self.board.insert(0, [0] * BOARD_W)

        n = len(cleared)
        if n:
            self.score += SCORE_TABLE.get(n, 0) * self.level
            self.lines += n
            self.level  = self.lines // 10 + 1

        self.piece = self.next
        self.next  = Piece()
        self.fall_timer = 0

    # ── 이동 / 회전 ────────────────────────────────────────
    def move(self, dx, dy):
        if self.valid(self.piece.cells(dx, dy)):
            self.piece.x += dx
            self.piece.y += dy
            return True
        return False

    def rotate(self):
        new_rot = (self.piece.rot + 1) % len(SHAPES[self.piece.kind])
        cells   = self.piece.cells(rot=new_rot)
        # 벽 킥 (±1)
        for kick in (0, 1, -1, 2, -2):
            if self.valid([(x + kick, y) for x, y in cells]):
                self.piece.x  += kick
                self.piece.rot = new_rot
                return

    def hard_drop(self):
        while self.move(0, 1):
            self.score += 2
        self.lock()

    def ghost_cells(self):
        dy = 0
        while self.valid(self.piece.cells(0, dy + 1)):
            dy += 1
        return self.piece.cells(0, dy)

    # ── 그리기 ─────────────────────────────────────────────
    def draw_cell(self, gx, gy, color, alpha=255):
        sx = BOARD_X + gx * CELL
        sy = BOARD_Y + gy * CELL
        surf = pygame.Surface((CELL - 1, CELL - 1))
        surf.fill(color)
        if alpha < 255:
            surf.set_alpha(alpha)
        self.screen.blit(surf, (sx, sy))
        # 하이라이트
        pygame.draw.line(self.screen, tuple(min(c + 80, 255) for c in color),
                         (sx, sy), (sx + CELL - 2, sy), 2)

    def draw_board(self):
        # 배경
        pygame.draw.rect(self.screen, GRAY,
                         (BOARD_X - 2, BOARD_Y - 2,
                          BOARD_W * CELL + 4, BOARD_H * CELL + 4), 2)
        for y in range(BOARD_H):
            for x in range(BOARD_W):
                v = self.board[y][x]
                if v:
                    self.draw_cell(x, y, COLORS[v])
                else:
                    pygame.draw.rect(self.screen, DGRAY,
                                     (BOARD_X + x * CELL, BOARD_Y + y * CELL,
                                      CELL - 1, CELL - 1), 1)

    def draw_piece(self):
        # 고스트
        for x, y in self.ghost_cells():
            if y >= 0:
                s = pygame.Surface((CELL - 1, CELL - 1))
                s.set_alpha(60)
                s.fill(COLORS[self.piece.kind])
                self.screen.blit(s, (BOARD_X + x * CELL, BOARD_Y + y * CELL))
        # 실제 피스
        for x, y in self.piece.cells():
            if y >= 0:
                self.draw_cell(x, y, COLORS[self.piece.kind])

    def draw_next(self):
        lbl = self.font_s.render("NEXT", True, WHITE)
        self.screen.blit(lbl, (BOARD_X + BOARD_W * CELL + 20, BOARD_Y))
        ox = BOARD_X + BOARD_W * CELL + 20
        oy = BOARD_Y + 30
        for cx, cy in SHAPES[self.next.kind][0]:
            pygame.draw.rect(self.screen, COLORS[self.next.kind],
                             (ox + cx * 22, oy + cy * 22, 21, 21))

    def draw_hud(self):
        items = [
            ("SCORE", self.score),
            ("LEVEL", self.level),
            ("LINES", self.lines),
        ]
        for i, (label, val) in enumerate(items):
            lbl = self.font_s.render(label, True, WHITE)
            val_s = self.font_m.render(str(val), True, COLORS[i + 1])
            self.screen.blit(lbl,   (10, BOARD_Y + i * 70))
            self.screen.blit(val_s, (10, BOARD_Y + i * 70 + 22))

    def draw_overlay(self, title, sub=""):
        surf = pygame.Surface((SCREEN_W, SCREEN_H), pygame.SRCALPHA)
        surf.fill((0, 0, 0, 160))
        self.screen.blit(surf, (0, 0))
        t = self.font_l.render(title, True, WHITE)
        self.screen.blit(t, t.get_rect(center=(SCREEN_W // 2, SCREEN_H // 2 - 30)))
        if sub:
            s = self.font_s.render(sub, True, DGRAY)
            self.screen.blit(s, s.get_rect(center=(SCREEN_W // 2, SCREEN_H // 2 + 20)))

    def draw(self):
        self.screen.fill(BLACK)
        self.draw_board()
        if not self.game_over:
            self.draw_piece()
        self.draw_next()
        self.draw_hud()

        title = self.font_m.render("TETRIS", True, COLORS[6])
        self.screen.blit(title, title.get_rect(center=(SCREEN_W // 2, 20)))

        if self.game_over:
            self.draw_overlay("GAME OVER", "R = 다시시작 / Q = 종료")
        elif self.paused:
            self.draw_overlay("PAUSED", "P = 계속")

        pygame.display.flip()

    # ── 메인 루프 ──────────────────────────────────────────
    def run(self):
        keys_down = set()
        move_timer = 0
        MOVE_DELAY  = 170
        MOVE_REPEAT = 50

        while True:
            dt = self.clock.tick(FPS)

            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit(); sys.exit()

                if event.type == pygame.KEYDOWN:
                    keys_down.add(event.key)
                    move_timer = 0

                    if event.key == pygame.K_q:
                        pygame.quit(); sys.exit()
                    if event.key == pygame.K_r:
                        self.reset(); continue
                    if event.key == pygame.K_p and not self.game_over:
                        self.paused = not self.paused

                    if self.game_over or self.paused:
                        continue

                    if event.key == pygame.K_UP or event.key == pygame.K_x:
                        self.rotate()
                    if event.key == pygame.K_SPACE:
                        self.hard_drop()

                if event.type == pygame.KEYUP:
                    keys_down.discard(event.key)

            if self.game_over or self.paused:
                self.draw(); continue

            # 좌우 연속 입력
            if pygame.K_LEFT in keys_down or pygame.K_RIGHT in keys_down:
                move_timer += dt
                threshold = MOVE_DELAY if move_timer < MOVE_DELAY + dt else MOVE_REPEAT
                if move_timer >= threshold:
                    if pygame.K_LEFT in keys_down:
                        self.move(-1, 0)
                    if pygame.K_RIGHT in keys_down:
                        self.move(1, 0)
                    move_timer = 0
            else:
                move_timer = 0

            # 낙하
            interval = FAST_FALL if pygame.K_DOWN in keys_down else max(
                50, FALL_INTERVAL - (self.level - 1) * 40)
            self.fall_timer += dt
            if self.fall_timer >= interval:
                if not self.move(0, 1):
                    self.lock()
                self.fall_timer = 0

            self.draw()


if __name__ == "__main__":
    TetrisGame().run()
