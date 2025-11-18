package cl.uc.cc5002.tarea4.notas.model;

import jakarta.persistence.*;

@Entity
@Table(name = "nota")
public class Nota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "aviso_id", nullable = false)
    private Integer avisoId;

    @Column(name = "nota", nullable = false)
    private Integer nota;

    public Nota() {
    }

    public Nota(Integer avisoId, Integer nota) {
        this.avisoId = avisoId;
        this.nota = nota;
    }

    public Integer getId() {
        return id;
    }

    public Integer getAvisoId() {
        return avisoId;
    }

    public void setAvisoId(Integer avisoId) {
        this.avisoId = avisoId;
    }

    public Integer getNota() {
        return nota;
    }

    public void setNota(Integer nota) {
        this.nota = nota;
    }
}

