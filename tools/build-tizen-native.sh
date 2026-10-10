#!/bin/sh
set -eu
: "${NACL_SDK_ROOT:?Set NACL_SDK_ROOT to Samsung pepper_56}"
project_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
output_dir=${NACL_OUTPUT_DIR:-"$project_dir/dist/native"}
mkdir -p "$output_dir"
"$NACL_SDK_ROOT/toolchain/linux_pnacl/bin/arm-nacl-clang++" \
  -std=gnu++11 -O2 -Wall -Wextra -I"$NACL_SDK_ROOT/include" \
  "$project_dir/tizen/native/remote.cc" \
  -L"$NACL_SDK_ROOT/lib/clang-newlib_arm/Release" -lppapi_cpp -lppapi \
  -o "$output_dir/remote_arm.nexe"
"$NACL_SDK_ROOT/toolchain/linux_pnacl/bin/arm-nacl-strip" "$output_dir/remote_arm.nexe"
