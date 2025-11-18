package cl.uc.cc5002.tarea4.notas.repository;

import cl.uc.cc5002.tarea4.notas.model.Nota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotaRepository extends JpaRepository<Nota, Integer> {

    @Query("select avg(n.nota) from Nota n where n.avisoId = :avisoId")
    Double findPromedioByAvisoId(@Param("avisoId") Integer avisoId);

    long countByAvisoId(Integer avisoId);
}
