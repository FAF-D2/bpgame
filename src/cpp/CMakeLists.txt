cmake_minimum_required(VERSION 3.0)

project(bpws VERSION 0.2 LANGUAGES CXX)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O2")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Oi")

add_executable(bpws main.cpp bpws.hpp crypt.hpp)