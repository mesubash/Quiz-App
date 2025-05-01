package com.quizapp.backend.dto.request;


import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.*;
import com.quizapp.backend.model.enums.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    @Size(min = 3, max = 50)
    private String username;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, max = 100)
    private String password;

    private String firstName;
    private String lastName;
    @Enumerated
    @NotNull
    private Role role;


}
