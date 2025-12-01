#include <iostream>

void test(){
    int *a = new int[10];
    int b = 5;
    b = b + 1;
    a = a+b;
    std::cout << "Hello from test function!: "<<*a<<" "<<b<< std::endl;
}
int main() {

    test();

    std::cout << "Hello, World!" << std::endl;
    return 0;
}
