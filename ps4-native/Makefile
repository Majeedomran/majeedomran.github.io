# M4 HUB native PS4 client - OpenOrbis SDL2 + SceHttp starter
TITLE       := M4 HUB
VERSION     := 0.1.6
TITLE_ID    := MFOB00001
CONTENT_ID  := IV0000-MFOB00001_00-M4HUBNATIVE00001

TOOLCHAIN   := $(OO_PS4_TOOLCHAIN)
PROJDIR     := src
INTDIR      := $(PROJDIR)/x64/Debug
LIBMODULES := $(wildcard sce_module/*)
LIBS        := -lc -lkernel -lc++ -lSceUserService -lSceVideoOut -lSceAudioOut -lScePad -lSceSysmodule -lSceNet -lSceSsl -lSceHttp -lSDL2
CXXFLAGS    := --target=x86_64-pc-freebsd12-elf -fPIC -funwind-tables -c -isysroot $(TOOLCHAIN) -isystem $(TOOLCHAIN)/include -isystem $(TOOLCHAIN)/include/c++/v1
LDFLAGS     := -m elf_x86_64 -pie --script $(TOOLCHAIN)/link.x --eh-frame-hdr -L$(TOOLCHAIN)/lib $(LIBS) $(TOOLCHAIN)/lib/crt1.o
UNAME_S     := $(shell uname -s)
ifeq ($(UNAME_S),Linux)
  CXX := clang++-18
  LD  := ld.lld-18
  CDIR := linux
else ifeq ($(UNAME_S),Darwin)
  CXX := /usr/local/opt/llvm/bin/clang++
  LD  := /usr/local/opt/llvm/bin/ld.lld
  CDIR := macos
else
  $(error This starter Makefile currently supports Linux and macOS hosts)
endif

CPPFILES := $(wildcard $(PROJDIR)/*.cpp)
OBJS := $(patsubst $(PROJDIR)/%.cpp,$(INTDIR)/%.o,$(CPPFILES))

.PHONY: all clean check-env
all: $(CONTENT_ID).pkg

check-env:
	@test -n "$(OO_PS4_TOOLCHAIN)" || (echo "Set OO_PS4_TOOLCHAIN to the OpenOrbis toolchain root"; exit 1)
	@test -f "$(TOOLCHAIN)/lib/libSDL2.a" || (echo "SDL2 library missing from selected toolchain"; exit 1)
	@test -f "$(TOOLCHAIN)/include/orbis/Http.h" || (echo "OpenOrbis SceHttp headers missing"; exit 1)

$(INTDIR):
	mkdir -p $(INTDIR)

$(INTDIR)/%.o: $(PROJDIR)/%.cpp | $(INTDIR)
	$(CXX) $(CXXFLAGS) -o $@ $<

eboot.bin: check-env $(OBJS)
	$(LD) $(OBJS) -o $(INTDIR)/m4hub.elf $(LDFLAGS)
	$(TOOLCHAIN)/bin/$(CDIR)/create-fself -in=$(INTDIR)/m4hub.elf -out=$(INTDIR)/m4hub.oelf --eboot "eboot.bin" --paid 0x3800000000000011

sce_sys/icon0.png: scripts/make_icon.py
	mkdir -p sce_sys
	python3 scripts/make_icon.py "$@"

sce_sys/param.sfo: Makefile
	mkdir -p sce_sys
	"$(TOOLCHAIN)/bin/$(CDIR)/PkgTool.Core" sfo_new $@
	"$(TOOLCHAIN)/bin/$(CDIR)/PkgTool.Core" sfo_setentry $@ APP_TYPE --type Integer --maxsize 4 --value 1
	"$(TOOLCHAIN)/bin/$(CDIR)/PkgTool.Core" sfo_setentry $@ APP_VER --type Utf8 --maxsize 8 --value '$(VERSION)'
	"$(TOOLCHAIN)/bin/$(CDIR)/PkgTool.Core" sfo_setentry $@ ATTRIBUTE --type Integer --maxsize 4 --value 0
	"$(TOOLCHAIN)/bin/$(CDIR)/PkgTool.Core" sfo_setentry $@ CATEGORY --type Utf8 --maxsize 4 --value 'gd'
	"$(TOOLCHAIN)/bin/$(CDIR)/PkgTool.Core" sfo_setentry $@ CONTENT_ID --type Utf8 --maxsize 48 --value '$(CONTENT_ID)'
	"$(TOOLCHAIN)/bin/$(CDIR)/PkgTool.Core" sfo_setentry $@ DOWNLOAD_DATA_SIZE --type Integer --maxsize 4 --value 0
	"$(TOOLCHAIN)/bin/$(CDIR)/PkgTool.Core" sfo_setentry $@ SYSTEM_VER --type Integer --maxsize 4 --value 0
	"$(TOOLCHAIN)/bin/$(CDIR)/PkgTool.Core" sfo_setentry $@ TITLE --type Utf8 --maxsize 128 --value '$(TITLE)'
	"$(TOOLCHAIN)/bin/$(CDIR)/PkgTool.Core" sfo_setentry $@ TITLE_ID --type Utf8 --maxsize 12 --value '$(TITLE_ID)'
	"$(TOOLCHAIN)/bin/$(CDIR)/PkgTool.Core" sfo_setentry $@ VERSION --type Utf8 --maxsize 8 --value '$(VERSION)'

pkg.gp4: eboot.bin sce_sys/about/right.sprx sce_sys/icon0.png sce_sys/param.sfo $(LIBMODULES)
	"$(TOOLCHAIN)/bin/$(CDIR)/create-gp4" -out $@ --content-id=$(CONTENT_ID) --files "$^"

$(CONTENT_ID).pkg: pkg.gp4
	"$(TOOLCHAIN)/bin/$(CDIR)/PkgTool.Core" pkg_build $< .

clean:
	rm -rf $(CONTENT_ID).pkg pkg.gp4 eboot.bin sce_sys $(INTDIR)
