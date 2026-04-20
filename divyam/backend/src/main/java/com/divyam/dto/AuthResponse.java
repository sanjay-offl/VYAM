package com.divyam.dto;

/**
 * Authentication response DTO.
 *
 * Returned by /api/auth/login and /api/auth/register.
 */
public class AuthResponse {

  public static class UserInfo {
    private Long id;
    private String name;
    private String email;
    private String role;

    public Long getId() {
      return id;
    }

    public void setId(Long id) {
      this.id = id;
    }

    public String getName() {
      return name;
    }

    public void setName(String name) {
      this.name = name;
    }

    public String getEmail() {
      return email;
    }

    public void setEmail(String email) {
      this.email = email;
    }

    public String getRole() {
      return role;
    }

    public void setRole(String role) {
      this.role = role;
    }
  }

  private String token;
  private UserInfo user;

  public AuthResponse() {
  }

  public AuthResponse(String token, UserInfo user) {
    this.token = token;
    this.user = user;
  }

  public String getToken() {
    return token;
  }

  public void setToken(String token) {
    this.token = token;
  }

  public UserInfo getUser() {
    return user;
  }

  public void setUser(UserInfo user) {
    this.user = user;
  }
}
